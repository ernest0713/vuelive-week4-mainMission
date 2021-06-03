//這個元件使用區域註冊方式，所以必須在createApp之前完成宣告，否則會出現錯誤
const delProductModal = {
    template: `
        <div id="delProductModal" ref="delProductModal" class="modal fade" tabindex="-1"
                aria-labelledby="delProductModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content border-0">
                <div class="modal-header bg-danger text-white">
                    <h5 id="delProductModalLabel" class="modal-title">
                    <span>刪除產品</span>
                    </h5>
                    <button type="button" class="btn-close" data-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    是否刪除
                    <strong class="text-danger">{{ productData.title }}</strong> 商品(刪除後將無法恢復)。
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-outline-secondary" data-dismiss="modal">
                    取消
                    </button>
                    <button type="button" class="btn btn-danger" @click="sendProductId(productData.id)">
                    確認刪除
                    </button>
                </div>
                </div>
            </div>
        </div>
    `,
    props: ['productData'],
    methods: {
        sendProductId(id){
            this.$emit('emit-id', id);
        }
    }
};

const app = Vue.createApp({
    data() {
        return {
            isLogin: false,
            loginData: {
                username: '',
                password: ''
            },
            apiPath: {
                login: 'https://vue3-course-api.hexschool.io/admin/signin', //method = post
                logout: 'https://vue3-course-api.hexschool.io/admin/logout', //method = post
                checkLogin: 'https://vue3-course-api.hexschool.io/api/user/check', //method = post
                addProduct: 'https://vue3-course-api.hexschool.io/api/deviltasi/admin/product', //method = post
                updateProduct: 'https://vue3-course-api.hexschool.io/api/deviltasi/admin/product/', //method  = put , 需在最後補上產品id
                deleteProduct: 'https://vue3-course-api.hexschool.io/api/deviltasi/admin/product/', //method  = delete , 需在最後補上產品id
                editProduct: 'https://vue3-course-api.hexschool.io/api/deviltasi/admin/product/', //method  = put , 需在最後補上產品id
                getProduct: 'https://vue3-course-api.hexschool.io/api/deviltasi/admin/products' //method  = get
            },
            userInfo: {},
            products: [],
            tempProduct: {
                // title: '', 
                // category: '',
                // origin_price: 0,
                // price: 0,
                // unit: '',
                // description: '',
                // content: '',
                // is_enabled: 1,
                // imageUrl : '',
                // imagesUrl: []
            },
            isNew: true,
            pagination: {}
        }
    },
    components: {
        delProductModal
    },
    methods: {
        login(){
            let vm = this;
            if(vm.loginData.username && vm.loginData.password !== ''){
                axios.post(vm.apiPath.login, vm.loginData)
                    .then((res)=>{
                        if(res.data.success){
                            vm.userInfo = res.data;
                            vm.isLogin = true;
                            console.log(res.data.message);
                            document.cookie = `userToken=${vm.userInfo.token}; expires=${new Date(vm.userInfo.expired)}`;
                            axios.defaults.headers.common.Authorization = vm.userInfo.token;
                            vm.getProduct();
                        } else {
                            console.log(res.data.message);
                            vm.loginData = {};
                        }    
                    }).catch(err => {
                        console.log(err);
                    })
            }
        },
        checkLogin(){
            let vm = this;
            let token = document.cookie.replace(/(?:(?:^|.*;\s*)userToken\s*\=\s*([^;]*).*$)|^.*$/, '$1');
            // console.log(token);
            axios.defaults.headers.common.Authorization = token;
            if(!token) return
            axios.post(vm.apiPath.checkLogin)
                .then((res)=>{
                    if(res.data.success){
                        vm.isLogin = true; 
                        vm.getProduct();
                    } else {
                        console.log(res.data.message);
                    }
                })
                .catch(err => {
                    console.log(err);
                })
        },
        getProduct(page = 1){
            let vm = this;
            axios.get(vm.apiPath.getProduct + `?page=${page}`)
                .then((res)=>{
                    if(res.data.success){
                        console.log('getProductAsuccess');
                        console.log(vm.apiPath.getProduct + `?page=${page}`);
                        vm.products = res.data.products;
                        vm.pagination = res.data.pagination;
                    } else {
                        console.log(res.data.message);
                    }
                })
                .catch(err => {
                    console.log(err);
                })
        },
        openModal(method = 'new', item = {}){
            let vm = this;
            if(method === 'new'){
                vm.isNew = true;
                vm.tempProduct = {};
                $('#productModal').modal('show');
            } else if(method === 'edit'){
                vm.isNew = false;
                vm.tempProduct = item;
                $('#productModal').modal('show');       
            } else if(method === 'delete'){
                vm.isNew = false;
                vm.tempProduct = item;
                $('#delProductModal').modal('show');       
            } 
        },
        addProduct(tempProduct = {}){
            let vm = this;
            if(Object.keys(tempProduct).length === 0) return
            axios.post(vm.apiPath.addProduct, { data: tempProduct })
                .then((res) => {
                    if(res.data.success){
                        console.log(res.data.message);
                        $('#productModal').modal('hide');
                        vm.getProduct();
                    } else {
                        throw res.data.message;
                    }
                })
                .catch(err => {
                    console.log(err);
                })
        },
        getProductData(data){
            //根據productModal回傳的data判斷是編輯還是新增產品去選擇功能
            // console.log(data);
            if(data.isNew){
                this.addProduct(data.data);
            } else {
                this.updateProduct(data.data);
            }
        },
        updateProduct(tempProduct = {}){
            let vm = this;
            if(Object.keys(tempProduct).length === 0) return
            let productData = {...tempProduct};
            axios.put(vm.apiPath.updateProduct + productData.id, { data: productData })
                .then((res) => {
                    console.log(res.data.message);
                    $('#productModal').modal('hide');
                    vm.getProduct();
                })
                .catch(err => {
                    console.log(err);
                })
        },
        delProduct(id){
            let vm = this;
            axios.delete(vm.apiPath.deleteProduct + id)
                .then((res) => {
                    console.log(res.data.message);
                    $('#delProductModal').modal('hide');
                    vm.getProduct();
                })
                .catch(err => {
                    console.log(err);
                })
        },
    },
    created(){
        this.checkLogin();
    }
});


const productModal = {
    template: `
        <div id="productModal" ref="productModal" class="modal fade" tabindex="-1" aria-labelledby="productModalLabel"
        aria-hidden="true">
            <div class="modal-dialog modal-xl">
            <div class="modal-content border-0">
                <div class="modal-header bg-dark text-white">
                <h5 id="productModalLabel" class="modal-title">
                    <span v-if="isNew">新增產品</span>
                    <span v-else>編輯產品</span>
                </h5>
                <button type="button" class="btn-close" data-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                <div class="row">
                    <div class="col-sm-4">
                    <div class="form-group">
                        <label for="imageUrl">主要圖片</label>
                        <input v-model="tempProduct.imageUrl" type="text" class="form-control" placeholder="請輸入圖片連結">
                        <img class="img-fluid" :src="tempProduct.imageUrl">
                    </div>
                    <div class="mb-1">多圖新增</div>
                    <div v-if="Array.isArray(tempProduct.imagesUrl)">
                        <div class="mb-1" v-for="(image, key) in tempProduct.imagesUrl" :key="key">
                        <div class="form-group">
                            <label for="imageUrl">圖片網址</label>
                            <input v-model="tempProduct.imagesUrl[key]" type="text" class="form-control"
                            placeholder="請輸入圖片連結">
                        </div>
                        <img class="img-fluid" :src="image">
                        </div>
                        <div
                        v-if="!tempProduct.imagesUrl.length || tempProduct.imagesUrl[tempProduct.imagesUrl.length - 1]">
                        <button class="btn btn-outline-primary btn-sm d-block w-100"
                            @click="tempProduct.imagesUrl.push('')">
                            新增圖片
                        </button>
                        </div>
                        <div v-else>
                        <button class="btn btn-outline-danger btn-sm d-block w-100" @click="tempProduct.imagesUrl.pop()">
                            刪除圖片
                        </button>
                        </div>
                    </div>
                    <div v-else>
                        <button class="btn btn-outline-primary btn-sm d-block w-100"
                        @click="createImages">
                        新增圖片
                        </button>
                    </div>
                    </div>
                    <div class="col-sm-8">
                    <div class="form-group">
                        <label for="title">標題</label>
                        <input id="title" v-model="tempProduct.title" type="text" class="form-control" placeholder="請輸入標題">
                    </div>

                    <div class="row">
                        <div class="form-group col-md-6">
                        <label for="category">分類</label>
                        <input id="category" v-model="tempProduct.category" type="text" class="form-control"
                            placeholder="請輸入分類">
                        </div>
                        <div class="form-group col-md-6">
                        <label for="price">單位</label>
                        <input id="unit" v-model="tempProduct.unit" type="text" class="form-control" placeholder="請輸入單位">
                        </div>
                    </div>

                    <div class="row">
                        <div class="form-group col-md-6">
                        <label for="origin_price">原價</label>
                        <input id="origin_price" v-model.number="tempProduct.origin_price" type="number" min="0"
                            class="form-control" placeholder="請輸入原價">
                        </div>
                        <div class="form-group col-md-6">
                        <label for="price">售價</label>
                        <input id="price" v-model.number="tempProduct.price" type="number" min="0" class="form-control"
                            placeholder="請輸入售價">
                        </div>
                    </div>
                    <hr>

                    <div class="form-group">
                        <label for="description">產品描述</label>
                        <textarea id="description" v-model="tempProduct.description" type="text" class="form-control"
                        placeholder="請輸入產品描述">
                    </textarea>
                    </div>
                    <div class="form-group">
                        <label for="content">說明內容</label>
                        <textarea id="description" v-model="tempProduct.content" type="text" class="form-control"
                        placeholder="請輸入說明內容">
                    </textarea>
                    </div>
                    <div class="form-group">
                        <div class="form-check">
                        <input id="is_enabled" v-model="tempProduct.is_enabled" class="form-check-input" type="checkbox"
                            :true-value="1" :false-value="0">
                        <label class="form-check-label" for="is_enabled">是否啟用</label>
                        </div>
                    </div>
                    </div>
                </div>
                </div>
                <div class="modal-footer">
                <button type="button" class="btn btn-outline-secondary" data-dismiss="modal">
                    取消
                </button>
                <button v-if="isNew" type="button" class="btn btn-primary" @click="sendData(true,tempProduct)">
                    確認
                </button>
                <button v-else type="button" class="btn btn-warning" @click="sendData(false,tempProduct)">
                    確認
                </button>
                </div>
            </div>
            </div>
        </div>`,
    props: ['isNew','tempProduct'],
    methods: {
        createImages(){
            this.tempProduct.imagesUrl = [];
            this.tempProduct.imagesUrl.push('');
        },
        sendData(isNew, productData){
            // console.log(isNew);
            this.$emit('emit-data', { isNew, data: productData })
        }
    }

};

const pagination = {
    template: `
        <nav aria-label="Page navigation">
            <ul class="pagination">
                <li class="page-item" :class="{ disabled: !pages.has_pre}">
                    <a class="page-link" href="#" @click.prevent="sendPage(pages.current_page - 1)">Previous</a>
                </li>
                <li class="page-item" :class="{ active: page === pages.current_page}" v-for="page in pages.total_pages" :key="page">
                    <a class="page-link" href="#" @click.prevent="sendPage(page)">{{ page }}</a>
                </li>
                <li class="page-item" :class="{ disabled: !pages.has_next}">
                    <a class="page-link" href="#" @click.prevent="sendPage(pages.current_page + 1)">Next</a>
                </li>
            </ul>
        </nav>
    `,
    props: ['pages'],
    methods: {
        sendPage(page){
            this.$emit('emit-page', page);
        }
    }
};

//Component 全域註冊方式
app.component('productModal', productModal);
app.component('pagination', pagination);


app.mount('#app');
// Vue.createApp(app).mount('#app');





