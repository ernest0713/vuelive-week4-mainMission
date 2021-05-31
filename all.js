const app = {
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
                getProductAll: 'https://vue3-course-api.hexschool.io/api/deviltasi/admin/products/all' //method  = get
            },
            userInfo: {},
            products: {},
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
            uid: '7qGgtHQLzzPlUHsZpcKn0g9Ss6r2',
        }
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
                            vm.getProductAll();
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
            console.log(token);
            axios.defaults.headers.common.Authorization = token;
            if(!token) return
            axios.post(vm.apiPath.checkLogin)
                .then((res)=>{
                    if(res.data.success){
                        vm.isLogin = true; 
                        vm.getProductAll();
                    } else {
                        console.log(res.data.message);
                    }
                })
                .catch(err => {
                    console.log(err);
                })
        },
        getProductAll(){
            let vm = this;
            axios.get(vm.apiPath.getProductAll)
                .then((res)=>{
                    if(res.data.success){
                        console.log('getProductAll success');
                        vm.products = res.data.products;
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
        addProduct(){
            let vm = this;
            axios.post(vm.apiPath.addProduct, { data: vm.tempProduct })
                .then((res) => {
                    if(res.data.success){
                        console.log(res.data.message);
                        $('#productModal').modal('hide');
                        vm.getProductAll();
                    } else {
                        throw res.data.message;
                    }
                })
                .catch(err => {
                    console.log(err);
                })
        },
        updateProduct(){
            let vm = this;
            axios.put(vm.apiPath.updateProduct + vm.tempProduct.id, { data: vm.tempProduct })
                .then((res) => {
                    console.log(res.data.message);
                    $('#productModal').modal('hide');
                    vm.getProductAll();
                })
                .catch(err => {
                    console.log(err);
                })
        },
        delProduct(){
            let vm = this;
            axios.delete(vm.apiPath.deleteProduct + vm.tempProduct.id)
                .then((res) => {
                    console.log(res.data.message);
                    $('#delProductModal').modal('hide');
                    vm.getProductAll();

                })
                .catch(err => {
                    console.log(err);
                })
        },
        createImages(){
            this.tempProduct.imagesUrl = [];
            this.tempProduct.imagesUrl.push('');
        }
    },
    created(){
        this.checkLogin();
    }
}

Vue.createApp(app).mount('#app');





