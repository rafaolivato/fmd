interface ICreateUserDTO {
  name: string;
  email: string;
  password: string;
  role?: string;
  estabelecimentoId?: string; 
}

export { ICreateUserDTO };