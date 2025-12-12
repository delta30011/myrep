import { Item } from "@/components/ui/item"
import { Button } from "@/components/ui/button"
import { CircleXIcon, ListIcon } from "lucide-react"
import {useState, useRef} from 'react';

export default function DragList({list}) {

    const refs = useRef<HTMLElement[]>([]);
    const [activeItem,setActiveItem] = useState(-1);
    const [overItem, setOverItem] = useState(-1);

    const {items} = list;

    function toggleDrag (num:number, flag:boolean) {
        const item = refs.current[num];
        if (!item) return;
        (item as any).draggable=flag;
        setActiveItem((flag) ? num : -1);
    }


    function onDrop() {

        let arr = items,
            from = activeItem,
            to = overItem,
            where = to;

        if (to != from) {
            arr.splice(where, 0, arr.splice(from, 1)[0]);

            list.setItems([...arr])
        };

        setOverItem(-1);
        setActiveItem(-1)
    }

    function onDragOver(num:number) {
        if (activeItem >= 0) setOverItem(num);
    }

    function removeItem(num:number) {
        items.splice(num, 1);
        list.setItems([...items]);
    }

    return (
        <div className="draggable" onDragOver={(e)=>e.preventDefault()} onDrop={onDrop}>
        {
            (items || []).map((i:any, j:number) => (
                <Item  key={j}
                       className="flex justify-between corners-md hover:border-[#CCCCCC] hover:shadow-md border-solid"
                       ref={(el:HTMLElement)=>(refs.current[j] = el)}
                       onDragOver={()=>{onDragOver(j)}} >
                    <span style={{flexGrow:1}}>{i?.title}</span>
                    <Button size="icon"
                            variant="ghost"
                            onMouseDown={()=>{toggleDrag(j,true)}}
                            onMouseUp={()=>{toggleDrag(j,false)}}>
                        <ListIcon/>
                    </Button>
                    <Button size="icon" variant="ghost" title="Удалить" onClick={() => {removeItem(j)}}>
                        <CircleXIcon/>
                    </Button>
                </Item>
            ))
        }</div>
    )
}