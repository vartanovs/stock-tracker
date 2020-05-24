import { MODELING_PREP_STOCK_CHUNK_SIZE } from '../constants';

export const chunkList = <T>(list: T[], chunkSize = MODELING_PREP_STOCK_CHUNK_SIZE) => {
  const chunkedList: T[][] = [];
  while (list.length) {
    chunkedList.push(list.splice(0, chunkSize));
  }

  return chunkedList;
};

export const roundMillion = (inputNumber: string) => {
  const num = Number(inputNumber);
  return String(Math.round(num / 1000) / 1000);
};

export const roundRatio = (inputNumber: string) =>  {
  const num = Number(inputNumber);
  return String(Math.round(num * 1000) / 1000);
};

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
