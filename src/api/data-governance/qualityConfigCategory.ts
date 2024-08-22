import service from '@/utils/request'

export const useCategoryApi = (id: number) => {
	return service.get('/data-governance/quality-config-category/' + id)
}

export const useCategorySubmitApi = (dataForm: any) => {
	if (dataForm.id) {
		return service.put('/data-governance/quality-config-category', dataForm)
	} else {
		return service.post('/data-governance/quality-config-category', dataForm)
	}
}

export const listTreeApi = () => {
	return service.get('/data-governance/quality-config-category/list-tree')
}

export const delTreeNodeApi = (id: number) => {
	return service.delete('/data-governance/quality-config-category/' + id)
}