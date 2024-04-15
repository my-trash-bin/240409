export default interface API {
  method: "POST";
  path: "/api/auth/register";
  request: {
    nickname: string;
  };
  response: { success: boolean };
}
