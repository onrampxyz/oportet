import { Button } from "@porto/ui";
import { useFundsContext, type View } from "~/contexts";
import { Layout } from "../Layout";

export const Options = [
  {
    id: "receive-via-qr",
    label: "Receive via QR",
  },
  {
    id: "global-deposit",
    label: "Global Deposit",
  },
];

export function OptionSelection() {
  const { setView } = useFundsContext();

  return (
    <Layout>
      <Layout.Content>
        <div className="flex gap-2 p-2 pt-4">
          {Options.map((option) => {
            return (
              <Button
                className="min-h-32 flex-1! items-center rounded-lg"
                key={option.id}
                onClick={() => {
                  setView(option.id as View);
                }}
                type="button"
                variant="secondary"
              >
                {option.label}
              </Button>
            );
          })}
        </div>
      </Layout.Content>
    </Layout>
  );
}
