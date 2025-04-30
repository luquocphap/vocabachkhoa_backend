export const handleSuccessResponse = (
    message = "Lấy dữ liệu thành công",
    code = 200,
    metaData = null,
  ) => {
    return {
      status: `success`,
      message, //object literal
      code,
      metaData,
    };
  };
  
  export const handleErrorResponse = (
    message = "Internal Server Error",
    code = 500,
  ) => {
    return { status: "failed", message, code };
  };
  