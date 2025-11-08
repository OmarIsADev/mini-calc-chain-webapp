import { create } from "zustand";
import type { IPopulatedChain, IPopulatedOperation } from "@/models/Chain";

type ChainsState = {
  chains: IPopulatedChain[];
  addChain: (chain: IPopulatedChain | IPopulatedChain[]) => void;
  removeChain: (_id: string) => void;
  appendOperation: (
    operation: IPopulatedOperation,
    parentOperationId: string,
    chainId: string
  ) => void;
  removeOperation: (operationId: string, chainId: string) => void;
};

const findAndAppendOperation = (
  operations: IPopulatedOperation[],
  targetParentId: string,
  newOperation: IPopulatedOperation
): IPopulatedOperation[] => {
  return operations.map((op) => {
    if (op._id.toString() === targetParentId) {
      return {
        ...op,
        operations: [...op.operations, newOperation],
      };
    }

    if (op.operations && op.operations.length > 0) {
      const updatedNestedOps = findAndAppendOperation(
        op.operations,
        targetParentId,
        newOperation
      );

      if (updatedNestedOps !== op.operations) {
        return {
          ...op,
          operations: updatedNestedOps,
        };
      }
    }

    return op;
  });
};

const findAndRemoveOperation = (
  operations: IPopulatedOperation[],
  targetOperationId: string
): IPopulatedOperation[] => {
  const filteredOps = operations.filter(
    (op) => op._id.toString() !== targetOperationId
  );

  if (filteredOps.length === operations.length) {
    return operations.map((op) => {
      if (op.operations && op.operations.length > 0) {
        const updatedNestedOps = findAndRemoveOperation(
          op.operations,
          targetOperationId
        );
        if (updatedNestedOps !== op.operations) {
          return { ...op, operations: updatedNestedOps };
        }
      }
      return op;
    });
  }

  return filteredOps;
};

const useChainsStore = create<ChainsState>((set) => ({
  chains: [],
  addChain: (chain) => {
    Array.isArray(chain)
      ? set((state) => ({ chains: [...state.chains, ...chain] }))
      : set((state) => ({ chains: [...state.chains, chain] }));
  },
  removeChain: (_id) =>
    set((state) => ({ chains: state.chains.filter((c) => c._id !== _id) })),
  appendOperation: (newOperation, parentOperationId, chainId) => {
    set((state) => {
      const updatedChains = state.chains.map((chain) => {
        if (chain._id.toString() !== chainId) {
          return chain;
        }

        if (!parentOperationId) {
          return {
            ...chain,
            operations: [...chain.operations, newOperation],
          };
        } else {
          const updatedOperations = findAndAppendOperation(
            chain.operations,
            parentOperationId,
            newOperation
          );

          return {
            ...chain,
            operations: updatedOperations,
          };
        }
      });

      return { chains: updatedChains };
    });
  },
  removeOperation: (operationId, chainId) => {
    set((state) => {
      const updatedChains = state.chains.map((chain) => {
        if (chain._id.toString() !== chainId) {
          return chain;
        }

        const updatedOperations = findAndRemoveOperation(
          chain.operations,
          operationId
        );

        return {
          ...chain,
          operations: updatedOperations,
        };
      });

      return { chains: updatedChains };
    });
  },
}));

export default useChainsStore;
