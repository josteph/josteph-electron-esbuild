/* Helper function for reading a posted JSON body */
const readJson = (res, onSuccess, onError, onAborted?) => {
  let buffer;
  /* Register data cb */
  res.onData((ab, isLast) => {
    try {
      const chunk = Buffer.from(ab);
      if (isLast) {
        let json;
        if (buffer) {
          try {
            json = JSON.parse(Buffer.concat([buffer, chunk]).toString());
          } catch (e) {
            onError(e);

            return;
          }
          onSuccess(json);
        } else {
          try {
            json = JSON.parse(chunk.toString());
          } catch (e) {
            onError(e);

            return;
          }
          onSuccess(json);
        }
      } else if (buffer) {
        buffer = Buffer.concat([buffer, chunk]);
      } else {
        buffer = Buffer.concat([chunk]);
      }
    } catch (err) {
      onError(err);
    }
  });

  /**
   * onAborted handler. `abort` only happens on two things
   * 1. The response stream is closed by `res.close()`
   * 2. Something really bad happened
   * */
  res.onAborted(onAborted);
};

export default readJson;
