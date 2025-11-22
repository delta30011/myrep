import Layout from "@/app/components/Layout";
import RootLayout from "@/app/components/rootlayout";
import {getData} from "@/pages/api/gettariffs/index";
import {useRouter} from "next/router";
import Back from './backbutton';

export default function Catalog ({id, data})
{
    return (<RootLayout><Layout title="" description="Catalog item">
        <Back/>

        <h1>{data.period}</h1>
        <p>{data.text}</p>
        <br/>
        <b>{id}</b>
    </Layout></RootLayout>)
}

export async function getStaticProps(context) {
    const {id} = context.params,
        data = getData({id});

    return {
        props:{id, data}
    }
}