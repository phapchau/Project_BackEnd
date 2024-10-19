const BookService = require("../services/book.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");

// name, price, quantity, publication_year, publisher_id, author

// Thêm 1 đối tượng book vào csdl
exports.create = async (req, res, next) => {
    // Không được bỏ trống name
    if (!req.body?.name) {
        return next(new ApiError(400, "name can not be empty"))
    }
    try {
        const bookService = new BookService(MongoDB.client);
        // Thông tin book từ req.body
        const document = await bookService.create(req.body);
        // document này chức 2 trường: acknowledged (thêm thành công hay không) và insertedId (ID của đối tượng được thêm)
        return res.send(document);
    } catch (error) {
        console.log(error);
        return next(new ApiError(500, "An error occurred while creating the book"));
    }
}

// Tìm tất cả theo name của book
exports.findAll = async (req, res, next) => {
    let documents = [];
    try {
        const { name } = req.query;
        const bookService = new BookService(MongoDB.client);
        if (name) {
            documents = await bookService.findByName(name);
        } else {
            documents = await bookService.find({});
        }
    } catch (error) {
        console.log(error);
        return next(new ApiError(500, "An error occurred while finding the book"))
    }
    return res.send(documents);
};

exports.findOne = async (req, res, next) => {
    try {
        const bookService = new BookService(MongoDB.client);
        // Lấy id từ truyền params /books/:id
        const document = await bookService.findByIdBook(req.params.id);
        if (!document) {
            return next(new ApiError(404, "Book not found"));
        }
        return res.send(document);
    } catch (error) {
        console.log(error);
        return next(new ApiError(500, `Error retrieving book with id=${req.params.id}`));
    }
};

exports.update = async (req, res, next) => {
    // Lấy 1 mảng các key của đối tượng (req.body từ client gửi lên), sau đó lấy độ dài mảng 
    // => Kiểm tra có đưa dữ liệu để cập nhật không
    if (Object.keys(req.body).lenth === 0) {
        return next(new ApiError(400, "Data to update can not be empty"));
    }
    try {
        const bookService = new BookService(MongoDB.client);
        const document = await bookService.update(req.params.id, req.body);
        if (!document) {
            return next(new ApiError(404, "Book not found"));
        }
        return res.send({ message: "Book was updated successfully" });
    } catch (error) {
        console.log(error);
        return next(new ApiError(500, `Error updating book with id=${req.params.id}`))
    }
};

exports.delete = async (req, res, next) => {
    try {
        const bookService = new BookService(MongoDB.client);
        const document = await bookService.delete(req.params.id);
        // Nếu null tức là không tìm thấy nên không xóa được
        if (!document) {
            return next(new ApiError(400, "Book not found"));
        }
        return res.send({ message: "Book was deleted successfully" });
    } catch (error) {
        console.log(error);
        return next(new ApiError(500, `Could not delete book with id=${req.params.id}`))
    }
};

exports.deleteAll = async (req, res, next) => {
    try {
        const bookService = new BookService(MongoDB.client);
        const result = await bookService.deleteAll();
        return res.send({ message: `${result.deletedCount} book was (books were) deleted successfully` })
    } catch (error) {
        console.log(error);
        return next(new ApiError(500, "An error occurred while removing all books"));
    }
};
