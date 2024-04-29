import React, { FormEvent, useState, SyntheticEvent } from "react";
import styles from "../constant/styles.js";
import validator from "validator";
import { useSockets } from '../context/socket.context';
import EVENTS from "../config/events";
import NavLink from "react-router-dom";
import { error } from "console";

type User = {
  email: string,
  password: string,
  username?: string
};

interface LoginElements extends HTMLFormControlsCollection {
    mail: HTMLInputElement;
    pwd: HTMLInputElement;
    nickname: HTMLInputElement;
  }
   
interface LoginForm extends HTMLFormElement {
    readonly elements: LoginElements;
}

const Login = () => {

  const { socket } = useSockets();
  
  // page en mode login => true, en mode register => false.
  const [login, setMode] = useState(true);
  let mode = " hidden";

  function changeMode(event: SyntheticEvent)
  {
    setMode(!login);

  }

    const onSubmit = (event: React.FormEvent<LoginForm>) => {
        event.preventDefault();

        const formElements = event.currentTarget.elements;  
        const mail = formElements.mail.value;
        const pwd = formElements.pwd.value;
        let nickname = "";

        if (formElements.nickname.value !== null)
          nickname = formElements.nickname.value;

        if (mail === "" || pwd === "" || (nickname === "" && !login))
        {
          alert("Champs manquants.");

          return;
        }

        if(!validator.isEmail(mail))
        {
          alert("Email invalide ! Veuillez recommencer !");

          return;
        }

        let data: User;
        let url: string;

        if (login)
        {  
          data = { email: mail, password: pwd };
          url = "http://localhost:4000/auth/login";
        }
        else
        {
          data = { email: mail, password: pwd, username: nickname };
          url = "http://localhost:4000/auth/register";
        }
          
        // console.log(data);

        fetch(url, {
          method: 'POST',
          headers: {
            Accept: 'application.json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        }).then(
          response => {
            // console.log(response);

            if (login)
            {
              if (response.status === 200)
              {
                alert("Connexion réussie");
                response.json().then(data => {
                  const username = data.username;
                  console.log(username);
                  socket.emit(EVENTS.CLIENT.SET_USERNAME, username);
                });

                // window.location.href="http://localhost:3000/";
              }
              else 
              {
                alert("Connexion échouée"); 
              }

              return;
            }
            else
            {
              if (response.status === 200)
              {
                alert("Compte ajouté avec succès");
                window.location.href="http://localhost:3000/";
              }
            else
              alert("Erreur lors de la création du compte: email déjà utilisé.");

              // Possible de différencier plusieurs types d'erreurs ?
            }
          }).catch(
            error => {console.log(error)}
            );
      };

    return (
        <div className={`${styles.form}`}>
          <span className={`${styles.titleContainer}`} > <h1 className={`${styles.title2}`}> {login ? "Login" : "Créer un compte"}</h1> </span>

          <form className={`${styles.form}`}onSubmit={onSubmit}>
              <div className={`${styles.formItem}`}>
              <label htmlFor="mail">Entrer l'adresse email:</label>
              <input id="mail" name="mail" type="email" className = {`${styles.inputText}`}/>
              </div>

              <div className={`${styles.formItem}`}>
              <label htmlFor="pwd">Entrer le mot de passe:</label>
              <input id="pwd" name="pwd" type="password" className = {`${styles.inputText}`}/>
              </div>

              <div className={`${login ? styles.hidden : styles.formItem}`} >
              <label htmlFor="nickname">Entrer le pseudo:</label>
              <input id="nickname" name="nickname" type="text" className = {`${styles.inputText}`}/>
              </div>

              <button id="btn" type="submit" className={`${styles.button}`}>Continuer</button>
          </form>

          <a role="button" className= {`${styles.link}`} onClick={changeMode}>{login ? "Pas encore de " : "Déjà un "}compte ?</a>

          </div>
    );
  }
  
  export default Login;
  