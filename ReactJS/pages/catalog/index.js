import Layout from "@/app/components/Layout";
import RootLayout from "@/app/components/rootlayout";
import Tags from "@/app/components/catalog/Tags";
import Buttons from "@/app/components/catalog/Buttons";
import {getData} from '@/pages/api/gettariffs/index';

export default function Catalog({items}) {
    return (<RootLayout>
        <Layout title="Каталог" description="Items list">
            <ul className="catalog"> {
                items.map((i) => <li key={i.id}>
                    <a href={`catalog/${i.id}`}>{i.title}</a>
                    <p>{i.text}</p>
                    <Tags item={i}/>
                    <Buttons item={i}/>
                </li>)
            }</ul>
        </Layout></RootLayout>)
}

export async function getServerSideProps(context) {
    const data = getData();
    return {
        props: {
            items: data
        }
    };
}
