import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    const companyId = getRouterParam(event, 'id');
    
    if (!companyId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID de l\'entreprise requis'
      });
    }

    // Récupérer les statistiques de likes pour l'entreprise
    const company = await prisma.gabonCompany.findUnique({
      where: { id: companyId },
      include: {
        likes: {
          where: { isLike: true },
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                createdAt: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!company) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Entreprise non trouvée'
      });
    }

    const likeCount = company.likes.length;
    const recentLikes = company.likes.slice(0, 5); // 5 derniers likes

    return {
      companyId,
      likeCount,
      gabonScore: company.gabonScore,
      status: company.status,
      verified: company.verified,
      recentLikes: recentLikes.map(like => ({
        id: like.id,
        user: like.user,
        createdAt: like.createdAt
      })),
      canVerify: likeCount >= 10 && company.gabonScore >= 80
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des likes:', error);
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Erreur lors de la récupération des likes'
    });
  }
});
