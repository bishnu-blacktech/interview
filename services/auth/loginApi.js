import http from "../../utility/http";

const loginApi = async (props) => {
  const { email, password, isRememberMe = false } = props;
  const loginResponse = await http.post("/userAuth/login/", {
    email,
    password,
    isRememberMe,
  });
  return loginResponse.data;
};

export default loginApi;
