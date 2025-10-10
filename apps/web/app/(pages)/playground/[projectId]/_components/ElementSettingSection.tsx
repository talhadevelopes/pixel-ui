import { Button } from "@workspace/ui/components/button";
import { BookAIcon } from "lucide-react";


export function ElementSettingSection() {
    return (
        <div className="w-96 shadow">
            <BookAIcon/>
            <Button>Save</Button>
        </div>
    )
}