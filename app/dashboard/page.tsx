// Add this import at the top of the file
import { BarChart3 } from "lucide-react";

// Add this button just before the closing </div> tag in the return statement
<Button asChild className="mt-8">
  <Link href="/dashboard/analytics">
    <BarChart3 className="mr-2 h-4 w-4" />
    View Analytics
  </Link>
</Button>