import com.facebook.react.bridge.Promise
import com.lucrasports.sdk.core.contest.tournament.PoolTournament
import com.lucrasports.sdk.core.contest.tournament.PoolTournament.FailedTournamentCall

object ErrorMapper {
    private object ErrorCodes {
        const val API_ERROR = "apiError"
        const val LOCATION_ERROR = "locationError"
        const val INSUFFICIENT_FUNDS = "insufficientFunds"
        const val NOT_ALLOWED = "notAllowed"
        const val NOT_INITIALIZED = "notInitialized"
        const val UNVERIFIED = "unverified"
        const val MISSING_DEMOGRAPHIC_INFORMATION = "missingDemographicInformation"
    }

    private inline fun String?.ifNullOrBlank(default: () -> String): String {
        return if (this.isNullOrBlank()) default() else this
    }

    private fun mapTournamentFailure(
        promise: Promise,
        failure: FailedTournamentCall
    ) {
        val (code, message) = when (failure) {
            is FailedTournamentCall.APIError ->
                ErrorCodes.API_ERROR to failure.message.ifNullOrBlank { "API error occurred" }

            is FailedTournamentCall.LocationError ->
                ErrorCodes.LOCATION_ERROR to failure.message.ifNullOrBlank { "Location error occurred" }

            FailedTournamentCall.UserStateError.InsufficientFunds ->
                ErrorCodes.INSUFFICIENT_FUNDS to "User has insufficient funds"

            FailedTournamentCall.UserStateError.NotAllowed ->
                ErrorCodes.NOT_ALLOWED to "User not allowed to perform operation"

            FailedTournamentCall.UserStateError.NotInitialized ->
                ErrorCodes.NOT_INITIALIZED to "User has not been initialized"

            FailedTournamentCall.UserStateError.Unverified ->
                ErrorCodes.UNVERIFIED to "User is not verified"

            FailedTournamentCall.UserStateError.DemographicInformationMissing ->
                ErrorCodes.MISSING_DEMOGRAPHIC_INFORMATION to "User has missing demographic information"
        }

        promise.reject(code, message)
    }

    fun rejectJoinTournamentError(
        promise: Promise,
        error: PoolTournament.JoinTournamentResult.Failure
    ) {
        mapTournamentFailure(promise, error.failure)
    }

    fun rejectRetrieveTournamentError(
        promise: Promise,
        error: PoolTournament.RetrieveTournamentResult.Failure
    ) {
        mapTournamentFailure(promise, error.failure)
    }

    fun rejectRecommendedTournamentsError(
        promise: Promise,
        error: PoolTournament.QueryRecommendedTournamentsResult.Failure
    ) {
        mapTournamentFailure(promise, error.failure)
    }
}
