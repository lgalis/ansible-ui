import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  PageForm,
  PageFormSubmitHandler,
  PageFormTextInput,
  PageHeader,
  PageLayout,
} from '../../../../framework';
import { RouteObj } from '../../../Routes';
import { EdaUserInfo } from '../../../common/Masthead';
import { usePostRequest } from '../../../common/crud/usePostRequest';
import { API_PREFIX } from '../../constants';
import { EdaControllerToken, EdaControllerTokenCreate } from '../../interfaces/EdaControllerToken';

function ControllerTokenInputs() {
  const { t } = useTranslation();
  return (
    <>
      <PageFormTextInput<EdaControllerTokenCreate>
        name="name"
        label={t('Name')}
        placeholder={t('Enter name')}
        isRequired
        maxLength={150}
        autoComplete="new-name"
      />
      <PageFormTextInput<EdaControllerTokenCreate>
        name="description"
        label={t('Description')}
        placeholder={t('Enter description ')}
        maxLength={150}
      />
      <PageFormTextInput<EdaControllerTokenCreate>
        name="token"
        label={t('Token')}
        isRequired
        maxLength={150}
        placeholder={t('Enter controller token')}
      />
    </>
  );
}

export function CreateControllerToken() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const postRequest = usePostRequest<EdaControllerTokenCreate, EdaControllerToken>();
  const user = EdaUserInfo();

  const onSubmit: PageFormSubmitHandler<EdaControllerTokenCreate> = async (token) => {
    await postRequest(`${API_PREFIX}/users/me/awx-tokens/`, token);
    navigate(RouteObj.EdaUserDetailsTokens.replace(':id', `${user?.id || ''}`));
  };
  const onCancel = () => navigate(-1);

  return (
    <PageLayout>
      <PageHeader
        title={t('Create Controller Token')}
        breadcrumbs={[
          { label: t('Users'), to: RouteObj.EdaUsers },
          {
            label: user?.username ?? '',
            to: RouteObj.EdaUserDetails.replace(':id', `${user?.id || ''}`),
          },
          {
            label: t('Controller tokens'),
            to: RouteObj.EdaUserDetailsTokens.replace(':id', `${user?.id || ''}`),
          },
          { label: user?.username ?? '' },
        ]}
      />
      <PageForm
        submitText={t('Create controller token')}
        onSubmit={onSubmit}
        cancelText={t('Cancel')}
        onCancel={onCancel}
      >
        <ControllerTokenInputs />
      </PageForm>
    </PageLayout>
  );
}
