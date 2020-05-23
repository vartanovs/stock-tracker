import { DEFAULT_CHUNK_SIZE } from './constants';

export const chunkList = <T>(list: T[], chunkSize = DEFAULT_CHUNK_SIZE) => {
  const chunkedList: T[][] = [];
  while (list.length) {
    chunkedList.push(list.splice(0, chunkSize));
  }

  return chunkedList;
};

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
