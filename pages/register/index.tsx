import { FC, FormEvent, useState } from "react";
import Link from "next/link";
import { CustomHeader, FormInput } from "../../src/components/common";
import { auth, db } from "../../src/db/firebase-config";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/router";

import style from "./register.module.scss";

const Register: FC = () => {
  const route = useRouter();

  const [userData, setUserData] = useState<any>({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [emailInUse, setEmailInUse] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const newUser = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        userData.password
      );
      await setDoc(doc(db, "users", newUser.user.uid), {
        email: userData.email,
        password: userData.password,
        created: serverTimestamp(),
      });
      sessionStorage.setItem("user", userData.email);
    } catch (err) {
      console.error(err);
      setEmailInUse(true);
      return;
    }
    setUserData({ email: "", password: "", confirmPassword: "" });
    setEmailInUse(false);
    route.push("/#home");
    console.log("Account created!");
  };

  return (
    <section className={style.register_container}>
      <div className={style.register_box}>
        <CustomHeader mainText="Załóż konto" />
        <form onSubmit={(e) => handleSubmit(e)}>
          <div className={style.inputs_box}>
            <FormInput
              label="Wpisz E-mail"
              errorMessage="Wprowadź poprawny adres email"
              onChange={(e: FormEvent) =>
                setUserData({
                  ...userData,
                  email: (e.target as HTMLInputElement).value,
                })
              }
              value={`${userData.email}`}
              type="email"
              name="email"
              pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$"
            />
            <FormInput
              label="Wpisz hasło"
              errorMessage="Hasło powinno zawierać litery, cyfrę, znak specjalny oraz mieścić się pomiędzy 8 a 20 znaków"
              onChange={(e: FormEvent) =>
                setUserData({
                  ...userData,
                  password: (e.target as HTMLInputElement).value,
                })
              }
              value={`${userData.password}`}
              type="password"
              name="password"
              pattern="^(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[!@#$%^<>&*])[a-zA-Z0-9!@#$%^<>&*]{8,20}$"
            />
            <FormInput
              label="Powtórz hasło"
              errorMessage="Hasła muszą być identyczne"
              onChange={(e: FormEvent) =>
                setUserData({
                  ...userData,
                  confirmPassword: (e.target as HTMLInputElement).value,
                })
              }
              value={`${userData.confirmPassword}`}
              type="password"
              name="confirmPassword"
              pattern={userData.password}
            />
          </div>
          {emailInUse && (
            <p className={style.error_msg}>E-mail jest już w użytku!</p>
          )}
          <div className={style.button_box}>
            <Link href="/login">
              <input type="button" value="Zaloguj się" />
            </Link>
            <input
              type="submit"
              value="Załóż konto"
              disabled={
                !(
                  userData.email.length > 0 &&
                  userData.password.length > 7 &&
                  userData.confirmPassword.length > 7
                )
              }
            />
          </div>
        </form>
      </div>
    </section>
  );
};

export default Register;
