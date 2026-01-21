import { Button, CopyButton, Details, Separator, Spinner } from "@porto/ui";
import { type Hex, Value } from "ox";
import type { Chain } from "~/routes/-components/GlobalDeposit/ChainSelection";
import { Layout } from "~/routes/-components/Layout";
import ArrowLeft from "~icons/lucide/arrow-left";
import CheckCircle from "~icons/lucide/check-circle";
import XCircle from "~icons/lucide/circle-x";
import ExternalLink from "~icons/lucide/external-link";

export type BridgeStatus = "idle" | "pending" | "completed" | "failed";

export type BridgeState = {
  status: BridgeStatus;
  sourceChainId?: number;
  sourceTxHash?: Hex.Hex;
  destinationTxHash?: Hex.Hex;
  message?: string;
};

export type BridgeToken = {
  symbol: string;
  address: Hex.Hex;
  bridgeContract: Hex.Hex;
  bridgeType: "hyperlane" | "layerzero";
  minDeposit: bigint;
  decimals: number;
  bridgeWrapper: Hex.Hex;
  icon: string;
  name: string;
};

export type BridgeProps = {
  bridgeState: BridgeState;
  bridgeError?: Error | null;
  chains?: readonly { id: number; name: string; blockExplorers?: any }[];
  targetChainId: number;
  selectedToken?: BridgeToken;
  selectedChain?: Chain;
  amount?: bigint;
  back: () => void;
  onSuccess: () => void;
  onRetry?: () => void | Promise<void>;
};

export function ErrorDisplay(
  props: Readonly<{ message: string; hidden: boolean }>,
) {
  const { message, hidden } = props;

  if (hidden) {
    return null;
  }

  return (
    <div className="break-[break-word] max-w-[320px] text-destructive text-sm">
      {message}
    </div>
  );
}

export function Bridge(props: Readonly<BridgeProps>) {
  const {
    bridgeState,
    selectedToken,
    selectedChain,
    amount,
    onSuccess,
    onRetry,
    back,
  } = props;

  return (
    <Layout>
      <Layout.Header>
        <div className="flex items-center gap-2">
          <Button
            className="h-auto! rounded-full! bg-transparent! p-2!"
            disabled={bridgeState.status === "pending"}
            onClick={() => back()}
            variant="secondary"
          >
            <ArrowLeft className="size-4 text-th_base" />
          </Button>
          <Layout.Header.Default
            subContent="Deposit to your RISE Wallet"
            title="Global Deposit"
            variant="default"
          />
        </div>
      </Layout.Header>
      <Layout.Content className="p-3!">
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-3 rounded-md border border-th_base px-2.5 py-1">
            {/* Source Chain Status */}
            <div className="flex items-start gap-2 pt-1 pb-2">
              <div className="mt-1">
                {bridgeState.status === "pending" && (
                  <Spinner color="purple" size="small" />
                )}
                {bridgeState.status === "completed" && (
                  <CheckCircle className="size-4" color="green" />
                )}
                {bridgeState.status === "failed" && (
                  <XCircle className="size-4" color="red" />
                )}
              </div>
              <div className="flex-1">
                <div className="pt-0.5 font-medium text-sm text-th_base">
                  {bridgeState.status === "pending"
                    ? "Bridging tokens..."
                    : "Bridge transaction"}
                </div>
                <ErrorDisplay
                  hidden={bridgeState.status !== "failed"}
                  message={bridgeState.message ?? ""}
                />
                {bridgeState.sourceTxHash && (
                  <div className="flex items-center gap-2">
                    <a
                      className="flex items-center gap-1 text-sm text-th_base-secondary hover:underline"
                      href={`https://testnet.layerzeroscan.com/tx/${bridgeState.sourceTxHash}`}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      View on explorer
                      <ExternalLink className="size-3" />
                    </a>
                    <CopyButton
                      size="mini"
                      value={bridgeState.sourceTxHash}
                      variant="content"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {selectedToken && amount !== undefined && (
            <Details opened>
              <div className="p-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-th_base">Source Chain</p>
                  <p className="text-th_base">
                    <span className="font-bold">{selectedChain?.name}</span> (
                    {selectedChain?.id})
                  </p>
                </div>
                <Separator />
                <div className="flex items-center justify-between gap-2">
                  <p className="text-th_base">Amount</p>
                  <p className="text-th_base">
                    <span className="font-bold">
                      {" "}
                      {Value.format(amount, selectedToken.decimals)}{" "}
                    </span>
                    {selectedToken.symbol}
                  </p>
                </div>
                <Separator />
                <div className="flex items-center justify-between gap-2">
                  <p className="text-th_base">Bridge type</p>
                  <p className="text-th_base">
                    {selectedToken.bridgeType.toUpperCase()}
                  </p>
                </div>
              </div>
            </Details>
          )}
        </div>
      </Layout.Content>

      {bridgeState.status !== "pending" && (
        <Layout.Footer className="min-h-0!">
          <Layout.Footer.Actions>
            {bridgeState.status === "failed" && onRetry && (
              <Button onClick={() => onRetry()} variant="primary" width="full">
                Retry
              </Button>
            )}
            {bridgeState.status === "completed" && (
              <Button
                onClick={() => onSuccess()}
                variant="primary"
                width="full"
              >
                Done
              </Button>
            )}
          </Layout.Footer.Actions>
        </Layout.Footer>
      )}
    </Layout>
  );
}
