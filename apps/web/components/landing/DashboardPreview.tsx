import Image from "next/image" // Import the Image component

export function DashboardPreview() {
    return (
        <div className="w-[calc(100vw-32px)] md:w-[1160px]">
            <div className="rounded-2xl p-2 shadow-2xl bg-card/70 dark:bg-card/30 border border-border">
                <img
                    src="https://tse2.mm.bing.net/th/id/OIP.G37tgeQqSNt7v2oPfj9ltQHaE7?pid=Api&P=0&h=180"
                    alt="Dashboard preview"
                    className="w-full h-auto object-cover rounded-xl shadow-lg"
                />
            </div>
        </div>
    )
}
