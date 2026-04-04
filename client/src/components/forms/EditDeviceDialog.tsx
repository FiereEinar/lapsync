import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import axiosInstance from "@/api/axios";
import { queryClient } from "@/main";
import { QUERY_KEYS } from "@/constants";
import { useEffect } from "react";
import { Device } from "@/types/device";
import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import _ from "lodash";

const deviceSchema = z.object({
  name: z.string().min(3, "Device name must be at least 3 characters"),
  deviceToken: z.string().min(1, "Token must be at least 1 characters"),
  isActive: z.boolean(),
  registration: z.string().optional().nullable(),
});

type DeviceFormValues = z.infer<typeof deviceSchema>;

interface EditDeviceDialogProps {
  device: Device;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditDeviceDialog({
  device,
  open,
  onOpenChange,
}: EditDeviceDialogProps) {
  const { toast } = useToast();

  const form = useForm<DeviceFormValues>({
    resolver: zodResolver(deviceSchema),
    defaultValues: {
      name: device.name,
      deviceToken: device.deviceToken,
      isActive: device.isActive,
      registration: device.registration?._id || "none",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: device.name,
        deviceToken: device.deviceToken,
        isActive: device.isActive,
        registration: device.registration?._id || "none",
      });
    }
  }, [open, device, form]);

  const { data: registrations = [] } = useQuery({
    queryKey: [QUERY_KEYS.REGISTRATIONS],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/registration");
      return Array.isArray(data.data) ? data.data : [];
    },
    enabled: open,
  });

  const onSubmit = async (values: DeviceFormValues) => {
    try {
      const payload = {
        ...values,
        registration: values.registration === "none" ? "" : values.registration,
      };

      await axiosInstance.put(`/device/${device._id}`, payload);

      toast({
        title: "Device updated",
        description: "Device has been successfully updated.",
      });

      onOpenChange(false);
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DEVICES] });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to update device",
        description:
          error?.response?.data?.message ||
          "Something went wrong while updating device.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>Edit Device</DialogTitle>
          <DialogDescription>
            Update the device details, token or participant assignment.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Device Name</FormLabel>
                  <FormControl>
                    <Input placeholder='Running Node #001' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='deviceToken'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Device Token</FormLabel>
                  <FormControl>
                    <Input placeholder='Token' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='registration'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assign to Participant</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || "none"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select a participant' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className='max-h-[200px]'>
                      <SelectItem value='none'>Unassigned</SelectItem>
                      {registrations.map((reg: any) => (
                        <SelectItem key={reg._id} value={reg._id}>
                          {_.startCase(reg.user?.name)} -{" "}
                          {_.startCase(reg.event?.name)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='isActive'
              render={({ field }) => (
                <FormItem className='flex items-center justify-between rounded-lg border p-4'>
                  <div>
                    <FormLabel>Active</FormLabel>
                    <p className='text-sm text-muted-foreground'>
                      Inactive devices cannot connect.
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type='submit' className='w-full'>
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
