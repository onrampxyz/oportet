import { CopyButton, QrCode } from "@porto/ui";
import { css } from "styled-system/css";
import type { Address } from "viem";
import { riseTestnet } from "viem/chains";
import { AddressFormatter } from "~/utils";

export function ReceiveViaQr({ address }: Readonly<ReceiveViaQr.Props>) {
  return (
    <div>
      <p className="pt-2 text-center font-bold text-lg text-th_base">
        RISE Wallet
      </p>
      <p className="pb-2 text-center text-sm text-th_base-secondary">
        Receive tokens via QR
      </p>
      <QrCode address={address ?? ""} chainId={riseTestnet.id} />
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
