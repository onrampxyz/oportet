import { Cuer } from "cuer";
import type { ReactNode } from "react";
import { css, cx } from "styled-system/css";

export function QrCode({
  address,
  chainId,
  className,
  value,
}: Readonly<QrCode.Props>) {
  const params = new URLSearchParams();

  if (chainId !== undefined) params.set("chainId", String(chainId));
  if (value !== undefined) params.set("value", String(value));
  const uri = `ethereum:${address}${params.size > 0 ? `?${params}` : ""}`;

  return (
    <div
      className={cx(
        css({
          alignItems: "center",
          backgroundColor: "var(--background-color-th_base-alt)",
          borderRadius: "var(--radius-th_medium)",
          padding: 12,
          placeSelf: "center",
          width: "fit-content,",
        }),
        className,
      )}
    >
      <div>
        <div
          className={css({
            height: 140,
            width: 140,
          })}
        >
          <Cuer.Root
            color="var(--text-color-th_base)"
            errorCorrection="low"
            shapeRendering="geometricPrecision"
            value={uri}
          >
            <Cuer.Finder radius={1} />
            <Cuer.Cells radius={1} />
          </Cuer.Root>
        </div>
      </div>
    </div>
  );
}

export namespace QrCode {
  export interface Props {
    address: string;
    chainId?: number;
    className?: string;
    label?: ReactNode;
    value?: bigint;
  }
}
