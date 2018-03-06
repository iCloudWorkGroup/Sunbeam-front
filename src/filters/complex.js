export const complex = (num = 0, decorate) => {
	return num > 1 ? decorate + 's' : decorate
}