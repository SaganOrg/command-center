import LoginPage from "./Login";

const Login = async ({
  params,
  searchParams,
}) => {
 const error = await searchParams?.error

  return (
    <>
      <LoginPage error={error} />
    </>
  );
};

export default Login;