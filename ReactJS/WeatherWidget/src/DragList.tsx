import { Item } from "@/components/ui/item"
import { Button } from "@/components/ui/button"
import { CircleXIcon } from "lucide-react"

export default function DragList({list}) {

    return (
        <div className="draggable">
        {
            list.items.length && list.items.map((i, j) => (
                <Item  key={j} className="flex justify-between">{i?.title}
                    <Button size="icon" variant="ghost" title="Удалить" onClick={() => {list.items.splice(j,1); list.setItems([...list.items])}}><CircleXIcon/></Button>
                </Item>
            ))
        }</div>
    )
}