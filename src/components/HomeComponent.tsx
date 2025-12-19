import React from "react";
import { useParams } from "react-router-dom";

type UserParams = {
    id: string;
}

function HomeComponent(){
    const {id} = useParams<UserParams>();
    return(
        <div>
            <h2>Bem vindo! {id}</h2>
        </div>
    )
}

export default HomeComponent;