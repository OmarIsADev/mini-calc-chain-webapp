"use client";
import type { IPopulatedChain, IPopulatedOperation } from "@/models/Chain";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Input } from "../ui/input";
import { useState } from "react";
import { X } from "lucide-react";
import { evaluate } from "mathjs";
import useChainsStore from "@/store/chains";

export default function Chain({ chain }: { chain: IPopulatedChain }) {
  const { appendOperation } = useChainsStore();

  const handleAddOperation = async (
    e: React.FormEvent<HTMLFormElement>,
    parentOperationId: string = ""
  ): Promise<boolean> => {
    e.preventDefault();
    e.stopPropagation();

    const formElement = e.currentTarget;

    console.log("called");
    const formData = new FormData(formElement);
    const operation = formElement.operation.value;

    const operationArray: string[] = operation
      .split("")
      .filter((l: string) => l !== " ");

    if (
      !["*", "+", "-", "/"].includes(operationArray[0]) ||
      operationArray[1].search(/[0-9]/) === -1
    ) {
      return false;
    }

    formData.append("operation", operation);
    formData.append("chainId", chain._id);
    formData.append("parentOperationId", parentOperationId);

    const response = await fetch("/api/protected/operation", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      appendOperation(await response.json(), parentOperationId, chain._id);

      formElement.reset();
      return true;
    }

    return false;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <p>{chain.author.username}</p>
          <p className="text-gray-500">
            {new Date(chain.createdAt).toLocaleDateString()}
          </p>
        </div>
        <p className="text-md">{chain.base}</p>
      </CardHeader>
      <CardContent>
        {chain.operations.map((operation) => (
          <Opperation
            key={operation._id}
            lastValue={Number(chain.base)}
            operation={operation}
            parentOperationId={operation._id}
            handleAddOperation={handleAddOperation}
          />
        ))}

        <form
          className="flex gap-2 items-center mt-4"
          onSubmit={handleAddOperation}
        >
          <Input name="operation" placeholder="Add operation Ex: +2" />
          <Button type="submit" className="cursor-pointer">
            Submit
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

const Opperation = ({
  operation,
  lastValue,
  parentOperationId = "",
  handleAddOperation,
}: {
  operation: IPopulatedOperation;
  lastValue: number;
  parentOperationId?: string;
  handleAddOperation: (
    e: React.FormEvent<HTMLFormElement>,
    parentOpperationId: string
  ) => Promise<boolean>;
}) => {
  const [isReplying, setIsReplying] = useState(false);

  const val = evaluate(lastValue + operation.base);

  return (
    <div className="border-l pl-4 flex flex-col items-start w-full">
      <div className="space-y-1 w-full">
        <p className="text-sm">{operation.author.username}</p>
        <div className="flex justify-between w-full">
          <p className="font-medium">{operation.base}</p>
          <p>{val}</p>
        </div>
      </div>
      {isReplying ? (
        <form
          className="flex gap-2 items-center mt-4 w-full"
          onSubmit={async (e) => {
            (await handleAddOperation(e, parentOperationId)) &&
              setIsReplying(false);
          }}
        >
          <Button
            type="button"
            variant="destructive"
            onClick={() => setIsReplying(false)}
          >
            <X />
          </Button>
          <Input
            name="operation"
            autoFocus
            placeholder="Add operation Ex: +2"
          />
          <Button type="submit">Submit</Button>
        </form>
      ) : (
        <Button
          variant="link"
          onClick={() => setIsReplying(true)}
          className="p-0 text-gray-500"
        >
          Reply
        </Button>
      )}
      {operation.operations.map((op) => (
        <Opperation
          handleAddOperation={handleAddOperation}
          parentOperationId={op._id}
          lastValue={val}
          key={op._id}
          operation={op}
        />
      ))}
    </div>
  );
};
