//const exports = module.exports = {};
exports._DB = {
    HOST: "localhost:27017",
    USER: "",
    PASSWORD: "",
    NAME: "test",
    ENGINE: "mongodb",
    CONN_URL: this.ENGINE + "://" + this.HOST + "/test"
};