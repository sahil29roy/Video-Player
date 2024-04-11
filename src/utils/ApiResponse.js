class ApiResponse{
    constructor(statusCode,data,message="Sucess"){
        this.data = data;
        this.statusCode = statusCode
        this.code = statusCode < 400
        this.message = message
    }
}
export {ApiResponse}