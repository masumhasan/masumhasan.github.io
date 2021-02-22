#include <stdio.h>
#include <string.h>
int main()
{
    char position[100];
    int i, length, count = 0;
    scanf("%s", &position);
    length = strlen(position);
    for (i = 0; i < length; i++)
    {
        if (position[i] == '0' && position[i + 1] == '0' && position[i + 2] == '0' && position[i + 3] == '0' && position[i + 4] == '0' && position[i + 5] == '0' && position[i + 6] == '0')
        {
            count = 1;
        }
        if (position[i] == '1' && position[i + 1] == '1' && position[i + 2] == '1' && position[i + 3] == '1' && position[i + 4] == '1' && position[i + 5] == '1' && position[i + 6] == '1')
        {
            count = 1;
        }
    }
    if (count == 1)
        printf("YES\n");
    else
        printf("NO\n");
    return 0;
}
