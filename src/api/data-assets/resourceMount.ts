import service from '@/utils/request'

export const useResourceMountApi = (id: number) => {
	return service.get('/data-assets/resource-mount/' + id)
}

export const useResourceMountSubmitApi = (dataForm: any) => {
	if (dataForm.id) {
		return service.put('/data-assets/resource-mount', dataForm)
	} else {
		return service.post('/data-assets/resource-mount', dataForm)
	}
}

export const listDbInfoById = (resourceId: number) => {
	return service.get('/data-assets/resource-mount/db-info/' + resourceId)
}

export const sqlCheckApi = (data: any) => {
	return service.post('/data-assets/resource-mount/sql-check', data)
}
