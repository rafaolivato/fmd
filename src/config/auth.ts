export default {
  jwt: {
    // Chave secreta usada para assinar o token. 
    // Mantenha esta chave SEGREDA e fora do GitHub!
    secret: process.env.APP_SECRET || 'uma_chave_secreta_padrao_muito_forte', 
    expiresIn: '1d', // Token expira em 1 dia
  },
  // O nome do header HTTP onde o token será enviado (padrão)
  header: 'Authorization',
};