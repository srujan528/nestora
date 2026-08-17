import { prisma, User } from '@qrent/shared';

class UserService {
  async updateProfile(userId: number, profileData: Partial<Pick<User, 'name' | 'phone'>>) {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        name: profileData.name,
        phone: profileData.phone,
      },
    });

    return this.getProfile(userId);
  }

  async getProfile(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        emailVerified: true,
        phoneVerified: true,
        createdAt: true,
        studentProfile: true,
      },
    });

    return user;
  }
}

export const userService = new UserService();
