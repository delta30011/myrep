import {useState} from "react";

interface Service {
    id: string,
    title: string,
    price: number
}

export default function ServicesList() {
    const [basket, setBasket] = useState<string[]>([]);
    const ServicesData: Service[] = [
        {id: '001', title: 'Самая первая услуга', price: 1000},
        {id: '002', title: 'Самая дорогая услуга', price: 1000000},
        {id: '003', title: 'Услуга третья', price: 500.50},
        {id: '004', title: 'Четвёртая услуга с длинным названием', price: 1000},
        {id: '005', title: 'И ещё одна услуга', price: 100},
    ];

    function addToBasket(id: string) {
        if (isInBasket(id)) {
            setBasket(basket.filter(i => i != id));
        } else {
            setBasket([...basket, id]);
        }
    }

    function isInBasket(id: string) {
        return basket.indexOf(id) > -1;
    }

    function getTotal() {
        let total: number = 0;
        ServicesData.forEach((i) => {
            isInBasket(i.id) && (total += i.price)
        });
        return total;
    }

    return (<>
        <h1 className="text-2xl font-bold">Выберите услуги, пожалуйста</h1>
        <ul className="flex flex-wrap gap-5 pt-10 justify-center">
            {ServicesData.map((i: Service) => (
                <li className="border rounded-md p-5 pb-20 flex-1 relative" key={i.id}>
                    <h3 className="text-xl">{i.title}</h3>
                    <p className="my-5 text-lg"><strong>{i.price} ₽</strong></p>
                    <button className="btn border-2 rounded-sm py-2 px-3 cursor-pointer absolute bottom-5"
                            onClick={() => {
                                addToBasket(i.id)
                            }}>{(isInBasket(i.id)) ? 'Удалить' : 'Добавить'}</button>
                </li>))}

        </ul>

        {basket.length && <div className="border-2 rounded-xl p-10 mt-10">
            <h1 className="text-2xl font-bold">Итого</h1>

            <ul>{ServicesData.map((i: Service) => (
                isInBasket(i.id) ? <li>{i.title} </li> : ''
            ))}</ul>
            <p>
                <strong>Total: {getTotal()} ₽</strong>
            </p>
            <button className="btn border-2 rounded-sm py-2 px-3 cursor-pointer">Оформить заказ</button>
        </div> || ''}
    </>)
}