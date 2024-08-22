<template>
	<el-dialog v-model="visible" :title="!dataForm.id ? '新增' : '修改'" :close-on-click-modal="false">
		<el-form ref="dataFormRef" :model="dataForm" :rules="dataRules" label-width="100px" @keyup.enter="submitHandle()">
				<el-form-item label="父级目录" prop="parentPath">
					<el-input disabled v-model="dataForm.parentPath" placeholder=""></el-input>
				</el-form-item>
				<el-form-item label="名称" prop="name">
					<el-input v-model="dataForm.name" placeholder="名称"></el-input>
				</el-form-item>
				<el-form-item label="类型" prop="type" v-if="dataForm.parentId != 0">
					<fast-select :disabled="!!dataForm.id" v-model="dataForm.type" placeholder="类型" dict-type="api_group_type" clearable></fast-select>
				</el-form-item>
				<el-form-item label="序号" prop="orderNo">
					<el-input-number v-model="dataForm.orderNo" :max='9999' placeholder="序号"></el-input-number>
				</el-form-item>
				<el-form-item label="描述" prop="description">
					<el-input type="textarea" v-model="dataForm.description"></el-input>
				</el-form-item>
		</el-form>
		<template #footer>
			<el-button @click="visible = false">取消</el-button>
			<el-button type="primary" @click="submitHandle()">确定</el-button>
		</template>
	</el-dialog>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus/es'
import { useApiGroupApi, useApiGroupSubmitApi } from '@/api/data-service/apiGroup'

const emit = defineEmits(['refreshDataList'])

const visible = ref(false)
const dataFormRef = ref()

const dataForm = reactive({
	parentId: '',
	parentPath: '',
	path: '',
	name: '',
	type: 1,
	orderNo: 0,
	description: ''
	})

const init = (id?: number, parentId: any, parentPath: any) => {
	visible.value = true
	
	dataForm.id = ''

	// 重置表单数据
	if (dataFormRef.value) {
		dataFormRef.value.resetFields()
	}
	dataForm.parentId = parentId
	dataForm.parentPath = parentPath
	
	if (id) {
		getCatalogue(id)
	}
}

const getCatalogue = (id: number) => {
	useApiGroupApi(id).then(res => {
		Object.assign(dataForm, res.data)
	})
}

const dataRules = ref({
	name: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	type: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	orderNo: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
})

// 表单提交
const submitHandle = () => {
	dataFormRef.value.validate((valid: boolean) => {
		if (!valid) {
			return false
		}
		dataForm.type = dataForm.parentId == 0 ? 1 : dataForm.type
		useApiGroupSubmitApi(dataForm).then(() => {
			ElMessage.success({
				message: '操作成功',
				duration: 500,
				onClose: () => {
					visible.value = false
					emit('refreshDataList')
				}
			})
		})
	})
}

defineExpose({
	init
})
</script>
