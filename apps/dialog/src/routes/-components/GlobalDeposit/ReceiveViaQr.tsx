import { CopyButton, QrCode } from "@porto/ui";
import { css } from "styled-system/css";
import type { Address } from "viem";
import { riseTestnet } from "viem/chains";
import { AddressFormatter } from "~/utils";

export function ReceiveViaQr({ address }: Readonly<ReceiveViaQr.Props>) {
  return (
    <div className="mt-4 mb-2 rounded-lg border-1 border-th_secondary bg-th_base-alt p-2">
      <p className="pt-2 text-center font-bold text-lg text-th_base">
        RISE Wallet
      </p>
      <p className="pb-2 text-center text-sm text-th_base">
        Receive tokens via QR
      </p>
      <QrCode
        address={address ?? ""}
        chainId={riseTestnet.id}
        className="bg-th_base"
      />
      <div className="pt-2">
        <div className="flex items-center justify-center gap-1 pb-2">
          <div
            className={css({
              color: "var(--text-color-th_base)",
              fontFamily: "monospace",
              fontSize: 12,
              fontWeight: 400,
              lineHeight: "14px",
              padding: "16px 4px",
              textAlign: "center",
              wordBreak: "break-all",
            })}
          >
            {AddressFormatter.shorten(address as Address, 8)}
          </div>
          {address && (
            <CopyButton className="text-th_base" size="mini" value={address} />
          )}
        </div>
      </div>
    </div>
  );
}

export namespace ReceiveViaQr {
  export interface Props {
    address: string;
  }
}
