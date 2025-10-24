export function DashboardPreview() {
    return (
        <div className="w-[calc(100vw-32px)] md:w-[1160px]">
            <div className="rounded-2xl p-2 shadow-2xl bg-card/70 dark:bg-card/30 border border-border">
                <img
                    src='/dashboard-preview.png'
                    alt="Dashboard preview"
                    className="w-full h-auto object-cover rounded-xl shadow-lg"
                />
            </div>
        </div>
    )
}