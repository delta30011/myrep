'use client';
import {useRouter} from "next/router";

export default function Back() {
    const router = useRouter();
    return (<a onClick={router.back} className="btn btn-back">Назад</a>)
}