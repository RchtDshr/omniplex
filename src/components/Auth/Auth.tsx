import React, { useState } from "react";
import styles from "./Auth.module.css";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Modal, ModalContent } from "@nextui-org/modal";
import { useDispatch } from "react-redux";
import { setAuthState, setUserDetailsState, setSubscriptionState } from "@/store/authSlice";
import { signInWithGoogle } from "@/utils/auth";
import Spinner from "../Spinner/Spinner";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const Auth = (props: Props) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    setLoading(true);
    try {
      const userData = await signInWithGoogle();
      
      if (userData) {
        // Update Redux state
        dispatch(setAuthState(true));
        dispatch(setUserDetailsState({
          uid: userData.uid,
          name: userData.name,
          email: userData.email,
          profilePic: userData.profilePic,
        }));
        dispatch(setSubscriptionState(userData.subscription));
        
        props.onClose();
      }
    } catch (error) {
      console.error("Authentication error:", error);
      alert("Sign in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      size={"lg"}
      radius="md"
      shadow="sm"
      backdrop={"blur"}
      isOpen={props.isOpen}
      onClose={props.onClose}
      placement="bottom-center"
      closeButton={<div></div>}
    >
      <ModalContent>
        {(onClose) => (
          <div className={styles.modal}>
            <div className={styles.titleContainer}>
              <div className={styles.title}></div>
              <div
                className={styles.close}
                onClick={() => {
                  onClose();
                }}
              >
                <Image
                  width={20}
                  height={20}
                  src={"/svgs/CrossWhite.svg"}
                  alt={"X"}
                />
              </div>
            </div>
            <div className={styles.container}>
              <div className={styles.title}>Welcome</div>
              <p className={styles.text}>Let&apos;s Create Your Account</p>

              {loading ? (
                <div className={styles.button}>
                  <div className={styles.spinner}>
                    <Spinner />
                  </div>
                  <div className={styles.buttonText}>Signing in</div>
                </div>
              ) : (
                <div className={styles.button} onClick={handleAuth}>
                  <Image
                    src={"/svgs/Google.svg"}
                    alt={"Google"}
                    width={24}
                    height={24}
                  />
                  <div className={styles.buttonText}>Continue with Google</div>
                </div>
              )}
            </div>
          </div>
        )}
      </ModalContent>
    </Modal>
  );
};

export default Auth;
