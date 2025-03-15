import { marshall } from "@aws-sdk/util-dynamodb";
import { MovieReviews } from "./types";

export const generateMovieReviewItem = (moviereview: MovieReviews) => {
  return {
    PutRequest: {
      Item: marshall(moviereview),
    },
  };
};

export const generateBatch = (data: MovieReviews[]) => {
  return data.map((e) => {
    return generateMovieReviewItem(e);
  });
};

