import Layout from "@/app/components/Layout";
import RootLayout from "@/app/components/rootlayout";
import {getData} from "@/pages/api/gettariffs/index";
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

const data = getData();

export async function getStaticProps(context) {
    const {id} = context.params,
        itemData = data.find((i)=>i.id===id);

    return {
        props:{id, data:itemData}
    }
}

export const getStaticPaths = async () => {

    const paths = data.map(i => ({
        params: { id: i.id.toString() },
    }));

    return {
        paths,
        fallback: false
    }
}