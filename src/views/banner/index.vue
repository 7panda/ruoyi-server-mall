<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="发布状态" prop="publishStatus">
        <el-select v-model="queryParams.publishStatus" placeholder="请选择" clearable>
          <!-- 注意：这里根据你的需求，0=上架，1=下架？还是反过来？ -->
          <!-- 通常字典 sys_normal_disable: 0=停用/下架，1=启用/上架 -->
          <!-- 如果你的数据库定义不同，请调整这里的 value -->
          <el-option label="上架0" value="0" />
          <el-option label="下架1" value="1" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 按钮工具栏 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['banner:banner:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['banner:banner:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['banner:banner:remove']"
        >删除</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 数据表格 -->
    <el-table v-loading="loading" :data="bannerList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="名称" align="center" prop="name" />
      <el-table-column label="图片" align="center" prop="pic" width="100">
        <template slot-scope="scope">
          <image-preview :src="scope.row.pic" :width="50" :height="50"/>
        </template>
      </el-table-column>
      <el-table-column label="排序" align="center" prop="sort" />
      <el-table-column label="发布状态" align="center" prop="publishStatus">
        <template slot-scope="scope">
          <!-- 使用字典标签显示 -->
          <dict-tag :options="dict.type.sys_normal_disable" :value="scope.row.publishStatus"/>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['banner:banner:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['banner:banner:remove']"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入名称" />
        </el-form-item>
        <el-form-item label="图片地址" prop="pic">
          <image-upload v-model="form.pic"/>
        </el-form-item>
        <el-form-item label="跳转链接" prop="linkUrl">
          <el-input v-model="form.linkUrl" placeholder="请输入跳转链接" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="form.sort" :min="0" placeholder="请输入排序" />
        </el-form-item>
        <el-form-item label="发布状态" prop="publishStatus">
          <!-- 【核心】双向绑定 form.publishStatus -->
          <el-radio-group v-model="form.publishStatus">
            <el-radio
              v-for="dict in dict.type.sys_normal_disable"
              :key="dict.value"
              :label="dict.value"
            >{{dict.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listPdBanner, getPdBanner, delPdBanner, addPdBanner, updatePdBanner } from "@/api/banner/banner";

export default {
  name: "Banner",
  dicts: ['sys_normal_disable'], // 字典：0=上，1=下 (根据实际字典配置)
  data() {
    return {
      loading: true,
      ids: [],
      single: true,
      multiple: true,
      showSearch: true,
      total: 0,
      bannerList: [],
      title: "",
      open: false,
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        name: null,
        publishStatus: null // 搜索默认全部
      },
      form: {},
      rules: {
        name: [{ required: true, message: "名称不能为空", trigger: "blur" }],
        pic: [{ required: true, message: "图片地址不能为空", trigger: "blur" }]
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询列表 */
    getList() {
      this.loading = true;
      listPdBanner(this.queryParams).then(response => {
        this.bannerList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        id: null,
        name: null,
        pic: null,
        linkUrl: null,
        sort: 0,
        publishStatus: '0', // 默认选中 '0' (上架)
        deptId: null
      };
      this.resetForm("form");
    },
    /** 搜索 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置搜索 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },
    /** 新增 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加轮播图";
    },
    /** 修改 (双向绑定关键逻辑) */
    handleUpdate(row) {
      this.reset(); // 1. 先重置表单，清除旧数据
      const id = row.id || this.ids;
      // 2. 请求后端获取详情
      getPdBanner(id).then(response => {
        // 3. 将后端数据赋值给 form
        //    此时 form.publishStatus 会被后端返回的值 (0 或 1) 覆盖
        //    v-model 会自动更新单选框的选中状态
        this.form = response.data;
        this.open = true;
        this.title = "修改轮播图";
      });
    },
    /** 提交 (关闭弹窗 + 刷新列表) */
    submitForm() {
      this.$refs["form"].validate(valid => {
        // TODO 存在逻辑问题，无法提交
        if (valid) {
          // 确保提交的是数字还是字符串，根据后端要求，通常后端能自动转换
          // 如果后端严格要求数字，可以在这转换：this.form.publishStatus = Number(this.form.publishStatus);

          if (this.form.id != null) {
            // 修改
            updatePdBanner(this.form).then(response => {
              this.msgSuccess("修改成功");
              this.open = false; // 【关闭弹窗】
              this.getList();    // 【刷新列表】
            });
          } else {
            // 新增
            addPdBanner(this.form).then(response => {
              this.msgSuccess("新增成功");
              this.open = false; // 【关闭弹窗】
              this.getList();    // 【刷新列表】
            });
          }
        }
      });
    },
    /** 删除 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$confirm('是否确认删除？', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(() => {
          return delPdBanner(ids);
        }).then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        }).catch(() => {});
    }
  }
};
</script>
