"use client";
import type { IPopulatedChain, IPopulatedOperation } from "@/models/Chain";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Input } from "../ui/input";
import { useState } from "react";
import { LucideMoreHorizontal, X } from "lucide-react";
import { evaluate } from "mathjs";
import useChainsStore from "@/store/chains";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import useAuthStore from "@/store/auth";

export default function Chain({ chain }: { chain: IPopulatedChain }) {
  const { appendOperation, removeOperation, removeChain } = useChainsStore();
  const { userData } = useAuthStore();

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

  const handleDelete = async () => {
    const response = await fetch(`/api/protected/chain?id=${chain._id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      return;
    }

    removeChain(chain._id);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <p>{chain.author.username}</p>
          <div className="flex flex-col gap-2 items-end justify-center">
            <DropdownMenu>
              <DropdownMenuTrigger className="w-min cursor-pointer">
                <LucideMoreHorizontal />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  variant="destructive"
                  disabled={userData?._id !== chain.author._id}
                  onClick={handleDelete}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <p className="text-gray-500">
              {new Date(chain.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <p className="text-md">{chain.base}</p>
      </CardHeader>
      <CardContent>
        {chain.operations.map((operation) => (
          <Opperation
            _id={(userData?._id as string) || ""}
            key={operation._id}
            lastValue={Number(chain.base)}
            operation={operation}
            chainId={chain._id}
            parentOperationId={operation._id}
            handleAddOperation={handleAddOperation}
            removeOperation={removeOperation}
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
  _id,
  parentOperationId = "",
  chainId,
  handleAddOperation,
  removeOperation,
}: {
  operation: IPopulatedOperation;
  lastValue: number;
  _id?: string;
  parentOperationId?: string;
  chainId: string;
  handleAddOperation: (
    e: React.FormEvent<HTMLFormElement>,
    parentOpperationId: string
  ) => Promise<boolean>;
  removeOperation: (operationId: string, chainId: string) => void;
}) => {
  const [isReplying, setIsReplying] = useState(false);

  const val = evaluate(lastValue + operation.base);

  const handleDelete = async () => {
    const response = await fetch(
      `/api/protected/operation?id=${operation._id}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      return;
    }

    removeOperation(operation._id, chainId);
  };

  return (
    <div className="border-l pl-4 flex flex-col items-start w-full">
      <div className="flex justify-between w-full">
        <div className="space-y-1 w-full">
          <p className="text-sm">{operation.author.username}</p>
          <p className="font-medium">{operation.base}</p>
        </div>
        <div className="flex gap-1 items-end flex-col w-fit">
          <DropdownMenu>
            <DropdownMenuTrigger className="w-min cursor-pointer">
              <LucideMoreHorizontal />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onClick={handleDelete}
                disabled={
                  operation.operations.length > 0 ||
                  operation.author._id !== _id
                }
                variant="destructive"
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
          _id={_id}
          removeOperation={removeOperation}
          chainId={chainId}
          lastValue={val}
          key={op._id}
          operation={op}
        />
      ))}
    </div>
  );
};
