interface ICreateUserDTO {
  name: string;
  email: string;
  password: string;
  role?: string; // Opcional, usará o default 'farmaceutico' do Prisma
}

export { ICreateUserDTO };