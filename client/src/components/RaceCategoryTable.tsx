import { Event, RaceCategory } from "@/types/event";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useUserStore } from "@/stores/user";
import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants";
import { Registration } from "@/types/registration";
import axiosInstance from "@/api/axios";
import { Badge } from "./ui/badge";

type RaceCategoryTableProps = {
  categories: RaceCategory[];
  event: Event;
};

export default function RaceCategoryTable({
  categories,
  event,
}: RaceCategoryTableProps) {
  const { user } = useUserStore((state) => state);

  const { data: registration } = useQuery({
    queryKey: [
      QUERY_KEYS.REGISTRATIONS,
      { userID: user._id, eventID: event._id },
    ],
    queryFn: async (): Promise<Registration> => {
      const { data } = await axiosInstance.get(`/registration`, {
        params: { userID: user._id, eventID: event._id },
      });
      return data.data[0] || null;
    },
  });

  const registrationID =
    typeof registration?.raceCategory === "string"
      ? registration?.raceCategory
      : registration?.raceCategory?._id;

  return (
    <div className="rounded-xl border border-border overflow-hidden bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30">
            <TableHead className="font-semibold">Category</TableHead>
            <TableHead className="font-semibold">Distance</TableHead>
            <TableHead className="font-semibold">Slots</TableHead>
            <TableHead className="font-semibold">Registered</TableHead>
            <TableHead className="font-semibold text-right">Price</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((cat) => (
            <TableRow key={cat._id} className="hover:bg-muted/30 transition-colors">
              <TableCell className="font-medium">
                {cat.name}
                {registrationID === cat._id && (
                  <Badge className='ml-2 bg-primary/10 text-primary border-0 text-[10px] uppercase tracking-wider'>Selected</Badge>
                )}
              </TableCell>
              <TableCell className="font-mono">{cat.distanceKm}K</TableCell>
              <TableCell>{cat.slots}</TableCell>
              <TableCell>{cat.registeredCount}</TableCell>
              <TableCell className="font-mono font-semibold text-right text-primary">₱{cat.price}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
