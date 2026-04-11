export function Footer() {
  return (
    <footer className="w-full border-t border-border bg-card mt-auto">
      <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
        <div className="font-medium">
          تم التطوير بواسطة:{" "}
          <span className="text-foreground font-semibold">نعمان الأنصاري</span>{" "}
          و{" "}
          <span className="text-foreground font-semibold">بلال باجرون</span>
        </div>
        <div className="font-medium">
          بإشراف:{" "}
          <span className="text-foreground font-semibold">
            المهندس عبد الرحمن المنتشري
          </span>
        </div>
        <div className="font-mono text-xs opacity-60">UPTIME &copy; 2025</div>
      </div>
    </footer>
  );
}
