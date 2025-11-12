import prisma from '../../utils/prisma';
import { z } from 'zod';


// Schéma de validation pour les données du like
const likeSchema = z.object({
  companyId: z.string().uuid(),
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  phone: z.string().regex(/^(\+241|0)[0-9]{8}$/, 'Numéro de téléphone gabonais invalide'),
  email: z.string().email('Email invalide'),
  isLike: z.boolean().default(true)
});

export default defineEventHandler(async (event) => {
  try {
    // Vérifier que la méthode est POST
    if (getMethod(event) !== 'POST') {
      throw createError({
        statusCode: 405,
        statusMessage: 'Méthode non autorisée'
      });
    }

    // Récupérer et valider les données du body
    const body = await readBody(event);
    const validatedData = likeSchema.parse(body);

    // Vérifier si l'utilisateur existe déjà
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: validatedData.email },
          { phone: validatedData.phone }
        ]
      }
    });

    // Si l'utilisateur existe, vérifier la cohérence des données
    if (user) {
      if (user.email !== validatedData.email || user.phone !== validatedData.phone) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Email et numéro de téléphone ne correspondent pas à un utilisateur existant'
        });
      }
      
      // Mettre à jour les informations si nécessaire
      if (user.firstName !== validatedData.firstName || user.lastName !== validatedData.lastName) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            firstName: validatedData.firstName,
            lastName: validatedData.lastName
          }
        });
      }
    } else {
      // Créer un nouvel utilisateur
      user = await prisma.user.create({
        data: {
          firstName: validatedData.firstName,
          lastName: validatedData.lastName,
          phone: validatedData.phone,
          email: validatedData.email
        }
      });
    }

    // Vérifier si l'entreprise existe
    const company = await prisma.gabonCompany.findUnique({
      where: { id: validatedData.companyId },
      include: { likes: true }
    });

    if (!company) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Entreprise non trouvée'
      });
    }

    // Vérifier si l'utilisateur a déjà liké cette entreprise
    const existingLike = await prisma.companyLike.findUnique({
      where: {
        companyId_userId: {
          companyId: validatedData.companyId,
          userId: user.id
        }
      }
    });

    if (existingLike) {
      // Mettre à jour le like existant
      const updatedLike = await prisma.companyLike.update({
        where: { id: existingLike.id },
        data: { isLike: validatedData.isLike }
      });

      return {
        success: true,
        message: validatedData.isLike ? 'Like mis à jour' : 'Dislike mis à jour',
        like: updatedLike
      };
    } else {
      // Créer un nouveau like
      const newLike = await prisma.companyLike.create({
        data: {
          companyId: validatedData.companyId,
          userId: user.id,
          isLike: validatedData.isLike
        }
      });

      // Vérifier si l'entreprise doit être validée
      await checkCompanyValidation(company.id);

      return {
        success: true,
        message: validatedData.isLike ? 'Like ajouté' : 'Dislike ajouté',
        like: newLike
      };
    }
  } catch (error) {
    console.error('Erreur lors du like:', error);
    
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Données invalides: ' + error.errors.map(e => e.message).join(', ')
      });
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Erreur lors du traitement du like'
    });
  }
});

// Fonction pour vérifier si une entreprise doit être validée
async function checkCompanyValidation(companyId: string) {
  const company = await prisma.gabonCompany.findUnique({
    where: { id: companyId },
    include: { 
      likes: {
        where: { isLike: true }
      }
    }
  });

  if (!company) return;

  const likeCount = company.likes.length;
  const shouldVerify = likeCount >= 10 && company.gabonScore >= 80;

  if (shouldVerify && company.status === 'PENDING') {
    await prisma.gabonCompany.update({
      where: { id: companyId },
      data: { 
        status: 'VERIFIED',
        verified: true
      }
    });

    console.log(`Entreprise ${company.name} validée automatiquement (${likeCount} likes, score: ${company.gabonScore}%)`);
  }
}
