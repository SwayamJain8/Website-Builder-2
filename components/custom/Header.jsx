import Image from "next/image";
import React, { useContext } from "react";
import { Button } from "../ui/button";
import { UserDetailContext } from "@/context/UserDetailContext";
import { LogIn, LogOut } from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import uuid4 from "uuid4";

const Header = () => {
  const { userDetail, setUserDetail } = useContext(UserDetailContext);
  const CreateUser = useMutation(api.users.CreateUser);

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      const userInfo = await axios.get(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        { headers: { Authorization: "Bearer " + tokenResponse?.access_token } }
      );

      // console.log(userInfo);
      const user = userInfo?.data;
      await CreateUser({
        name: user?.name,
        email: user?.email,
        picture: user?.picture,
        uid: uuid4(),
      });
      if (typeof window !== undefined) {
        localStorage.setItem("user", JSON.stringify(user));
      }
      setUserDetail(userInfo?.data);
      // Save this inside our database
    },
    onError: (errorResponse) => console.log(errorResponse),
  });

  return (
    <div className="p-4 px-5 flex justify-between items-center fixed top-0 left-0 right-0 z-50">
      <Image src={"/logo.png"} alt="logo" width="50" height="50" />
      <div className="flex gap-5">
        {!userDetail?.name ? (
          <>
            <Button
              variant={"ghost"}
              className="cursor-pointer text-white bg-slate-800"
              onClick={() => {
                googleLogin();
              }}
            >
              <LogIn />
              Sign In
            </Button>
          </>
        ) : (
          <div className="flex gap-5">
            <Button
              variant={"ghost"}
              className="text-white cursor-pointer bg-slate-800"
              onClick={() => {
                localStorage.removeItem("user");
                setUserDetail(null);
                window.location.reload();
                window.location.href = "/";
              }}
            >
              <LogOut />
              Sign Out
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
