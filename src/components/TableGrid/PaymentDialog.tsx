import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RestaurantTable } from "@/types/table";

interface PaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  table: RestaurantTable | null;
  payMethod: "cash" | "transfer" | null;
  showPayOpt: boolean;
  qrUrl: string;
  onConfirmPay: () => void;
  onSelectPayMethod: (method: "cash" | "transfer") => void;
}

const PaymentDialog: React.FC<PaymentDialogProps> = ({
  isOpen,
  onClose,
  table,
  payMethod,
  showPayOpt,
  qrUrl,
  onConfirmPay,
  onSelectPayMethod,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-orange-50 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-orange-600">
            Thanh toán - Bàn {table?.name || "N/A"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {!payMethod ? (
            <div className="flex flex-col space-y-2">
              <Button
                onClick={() => onSelectPayMethod("cash")}
                className="bg-orange-500 text-white hover:bg-orange-600"
              >
                Thanh toán bằng tiền mặt
              </Button>
              <Button
                onClick={() => onSelectPayMethod("transfer")}
                className="bg-orange-500 text-white hover:bg-orange-600"
              >
                Thanh toán bằng chuyển khoản
              </Button>
            </div>
          ) : showPayOpt ? (
            <div className="text-center">
              <p className="text-gray-700 mb-4">
                {payMethod === "cash"
                  ? "Vui lòng xác nhận thanh toán bằng tiền mặt."
                  : "Vui lòng quét mã QR để thanh toán."}
              </p>
              {payMethod === "transfer" && qrUrl && (
                <img src={qrUrl} alt="QR Code" className="mx-auto w-48 h-48" />
              )}
              <Button
                onClick={onConfirmPay}
                className="mt-4 bg-green-500 text-white hover:bg-green-600"
              >
                Xác nhận thanh toán
              </Button>
            </div>
          ) : (
            <p className="text-gray-700">Đang xử lý thanh toán...</p>
          )}
        </div>
        <DialogFooter>
          <Button
            onClick={onClose}
            className="bg-gray-300 text-gray-700 hover:bg-gray-400"
          >
            Hủy
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;